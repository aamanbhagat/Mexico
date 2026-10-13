// Renders the PNG/ICO favicons from public/favicon.svg (run once when the mark changes).
import { readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const svg = readFileSync('public/favicon.svg', 'utf8');
const png = (size) => new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();
writeFileSync('public/apple-touch-icon.png', png(180));
writeFileSync('public/icon-192.png', png(192));
writeFileSync('public/icon-512.png', png(512));

// Minimal ICO container with a single 32×32 PNG image.
const p32 = png(32);
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
const entry = Buffer.alloc(16);
entry.writeUInt8(32, 0);
entry.writeUInt8(32, 1);
entry.writeUInt8(0, 2);
entry.writeUInt8(0, 3);
entry.writeUInt16LE(1, 4);
entry.writeUInt16LE(32, 6);
entry.writeUInt32LE(p32.length, 8);
entry.writeUInt32LE(22, 12);
writeFileSync('public/favicon.ico', Buffer.concat([header, entry, p32]));
console.log('icons written');
