
import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'DOCS');
const destDir = path.join(process.cwd(), 'public', 'docs');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

const map = {
    'brand guide': 'brand_guide.txt',
    'writing style guide': 'writing_style_guide.txt',
    'collegeboard study guide': 'knowledge_base.txt'
};

Object.entries(map).forEach(([srcName, destName]) => {
    const srcPath = path.join(srcDir, srcName);
    const destPath = path.join(destDir, destName);

    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${srcName} -> ${destName}`);
    } else {
        console.error(`Source missing: ${srcName}`);
    }
});
