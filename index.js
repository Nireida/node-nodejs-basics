import * as readline from "node:readline";
import {access, readdir, writeFile} from "fs/promises";
import fs, {constants} from "fs";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function fileExists(filePath) {
    try {
        await access(filePath, constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

async function list(dirPath) {
    const exists = await fileExists(dirPath);
    if (!exists) {
        throw new Error('FS operation failed');
    }

    let files;
    try {
        files = await readdir(dirPath);
    } catch (err) {
        throw new Error('FS operation failed');
    }

    console.log('(index)'.padEnd(10) + 'Name'.padEnd(20) + 'Type');
    console.log('-'.repeat(40));

    let i = 0;
    for (const file of files) {
        if (file) {
            i = i + 1;
            console.log(i.toString().padEnd(10) + file.padEnd(20) + (file.includes('.') ? 'file' : 'directory'));
        }
    }

    return files;
}

async function read(path = 'src/streams/files/fileToRead.txt') {
    const readStream = fs.createReadStream(path);

    readStream.on('error', (err) => {
        console.error('Ошибка при чтении файла:', err.message);
    });

    readStream.on('data', (chunk) => {
        process.stdout.write(chunk.toString());
    });
}

function readLineSync(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function create(data) {
    const exists = await fileExists(data?.path);

    if (exists) {
        throw new Error('FS operation failed');
    }

    try {
        await writeFile(data?.path, data?.text || '');
    } catch (err) {
        throw new Error('FS operation failed');
    }
}

async function main() {
    let dir = process.cwd();
    const cd = 'cd ';
    const cat = 'cat ';
    const add = 'add ';
    const args = process.argv.slice(2);
    const mkdir = 'mkdir ';
    let username;

    for (const arg of args) {
        if (arg.startsWith('--username=')) {
            username = arg.split('=')[1];
        }
    }

    if (!username) {
        process.exit(1);
    }

    process.stdout.write(`Welcome to the File Manager, ${username}!\n`);

    while (true) {
        console.log(dir);
        const cmd = await readLineSync('$ ');
        if (cmd === '.exit') {
            break;
        } else if (cmd === 'ls') {
            await list(dir);
        } else if (cmd === 'up') {
            const index = dir.lastIndexOf('\\');
            dir = dir.substring(0, index);
        } else if (cmd.startsWith(cd)) {
           const files = await list(dir);
           const path = cmd.substring(cd.length);
           if (files.length && path && files.includes(path)) {
               dir = `${dir}\\${path}`;
           }
        } else if (cmd.startsWith(cat)) {
            const filename = cmd.substring(cat.length).trim();
            const filePath = `${dir}\\${filename}`;
            await read(filePath);
        } else if (cmd.startsWith(add)) {
            const filename = cmd.substring(add.length).trim();
            const filePath = `${dir}\\${filename}`;
            await create({path: filePath});
        } else if (cmd.startsWith(mkdir)) {
            const folderName = cmd.substring(mkdir.length).trim();
            await fs.promises.mkdir(folderName);
        }
    }
    console.log('Thank you for using File Manager, Username, goodbye!');
    rl.close();
}

main();
