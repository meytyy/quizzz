import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function createZip() {
  const zip = new JSZip();

  // Добавляем dist папку (production build)
  const distPath = path.join(projectRoot, 'dist');
  if (fs.existsSync(distPath)) {
    await addDirectoryToZip(zip, distPath, 'dist');
  } else {
    console.warn('⚠️  Папка dist не найдена. Запустите npm run build перед созданием архива.');
  }

  // Добавляем исходники проекта
  const sourceFiles = [
    'package.json',
    'package-lock.json',
    'vite.config.ts',
    'tsconfig.json',
    'tsconfig.node.json',
    'tailwind.config.js',
    'postcss.config.js',
    'index.html',
    'vitest.config.ts',
    'README.md',
    'src',
    'public',
    'flashcards_food_chem_kazakh.csv',
  ];

  for (const file of sourceFiles) {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        await addDirectoryToZip(zip, filePath, file);
      } else {
        const content = fs.readFileSync(filePath);
        zip.file(file, content);
      }
    }
  }

  // Создаем архив
  const buffer = await zip.generateAsync({ type: 'nodebuffer' });
  const outputPath = path.join(projectRoot, 'quiz_site.zip');
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`✅ Архив создан: ${outputPath}`);
  console.log(`📦 Размер: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
}

async function addDirectoryToZip(zip, dirPath, zipPath) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    const zipFilePath = path.join(zipPath, file).replace(/\\/g, '/');

    if (stat.isDirectory()) {
      await addDirectoryToZip(zip, filePath, zipFilePath);
    } else {
      // Пропускаем node_modules и другие ненужные файлы
      if (filePath.includes('node_modules') || 
          filePath.includes('.git') ||
          filePath.endsWith('.log')) {
        continue;
      }
      const content = fs.readFileSync(filePath);
      zip.file(zipFilePath, content);
    }
  }
}

createZip().catch(console.error);




