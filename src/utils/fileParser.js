const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');

async function parseCSV(filePath) {
    const results = [];
    const parser = fs.createReadStream(filePath)
        .pipe(csv({
            mapValues: ({ header, value }) => {
                if (header === 'marks') {
                    return Number(value) || 0;
                }
                return value;
            }
        }));

    for await (const record of parser) {
        results.push({
            question: record.question,
            options: [record.option1, record.option2, record.option3, record.option4],
            correctAnswer: record.correctAnswer,
            marks: record.marks
        });
    }

    return results;
}

function parseExcel(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    return data.map(row => ({
        question: row.question,
        options: row.options,
        correctAnswer: row.correctAnswer,
        marks: Number(row.marks) || 0
    }));
}

module.exports = { parseCSV, parseExcel };