import { readFile } from "fs";

export async function loadData(name) {
  return new Promise((resolve, reject) => {
    readFile(`server/data/${name}.json`, (err, data) => {
      if (err) reject(err);
      else resolve(JSON.parse(data.toString("utf8")));
    });
  });
}

export function minToHours(minutes) {
  if (!minutes) return 0;
  return Math.floor(minutes / 60);
}
