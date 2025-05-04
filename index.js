// const args = process.argv.slice(2);
// let username;
//
// for (const arg of args) {
//     if (arg.startsWith('--username=')) {
//         username = arg.split('=')[1];
//     }
// }
//
// if (!username) {
//     process.exit(1);
// }
//
// process.stdout.write(`Welcome to the File Manager, ${username}!\n`);
// process.on('SIGINT', () => {
//     console.log('Thank you for using File Manager, Username, goodbye!');
//     process.exit(0);
// });
// process.on('data', (chunk) => {
//     process.stdout.write(chunk.toString());
// });
//

import * as readline from "node:readline";
import {access, readdir} from "fs/promises";
import {constants} from "fs";

// Создаем интерфейс для ввода/вывода
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

async function list(path) {
    const exists = await fileExists(path);

    if (!exists) {
        throw new Error('FS operation failed');
    }

    try {
        return await readdir(path);
    } catch (err) {
        throw new Error('FS operation failed');
    }
}

function readLineSync(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
    let dir = process.cwd();
    const cd = 'cd ';
    while (true) {
        console.log(dir);
        const cmd = await readLineSync('$ ');
        if (cmd === '.exit') {
            break;
        } else if (cmd === 'ls') {
            console.log(await list(dir));
        } else if (cmd === 'up') {
            const index = dir.lastIndexOf('\\');
            dir = dir.substring(0, index);
        } else if (cmd.startsWith(cd)) {
           const files = await list(dir);
           const path = cmd.substring(cd.length);
           if (files.length && path && files.includes(path)) {
               dir = `${dir}\\${path}`;
           }
        }
    }

    rl.close();
}

main();
