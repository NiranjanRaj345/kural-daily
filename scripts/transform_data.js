const fs = require('fs');
const path = require('path');

// Read the source JSON files
const sourcePath = path.join(__dirname, '../../temp_data/thirukkural.json');
const detailPath = path.join(__dirname, '../../temp_data/detail.json');
const destPath = path.join(__dirname, '../assets/data/thirukkural.json');

try {
  const rawData = fs.readFileSync(sourcePath, 'utf8');
  const rawDetail = fs.readFileSync(detailPath, 'utf8');
  
  const source = JSON.parse(rawData);
  const details = JSON.parse(rawDetail);
  
  // Create a lookup map for chapter details based on kural number
  const kuralMap = new Map();

  // Iterate through the nested structure of detail.json to build the map
  // Structure: Root -> Section (Paul) -> ChapterGroup (Iyal) -> Chapter (Adhigaram) -> Range (start-end)
  
  // The detail.json structure is a bit deep.
  // Root is an array with one object containing "section"
  const sections = details[0].section.detail;

  sections.forEach(section => {
    const sectionTam = section.name;
    const sectionEng = section.translation;
    
    const chapterGroups = section.chapterGroup.detail;
    
    chapterGroups.forEach(group => {
      const groupTam = group.name;
      const groupEng = group.translation;
      
      const chapters = group.chapters.detail;
      
      chapters.forEach(chapter => {
        const chapterTam = chapter.name;
        const chapterEng = chapter.translation;
        const start = chapter.start;
        const end = chapter.end;
        
        // Map each kural number in this range to its metadata
        for (let i = start; i <= end; i++) {
          kuralMap.set(i, {
            sect_tam: sectionTam,
            sect_eng: sectionEng,
            chapgrp_tam: groupTam,
            chapgrp_eng: groupEng,
            chap_tam: chapterTam,
            chap_eng: chapterEng
          });
        }
      });
    });
  });

  // Now transform the flat kural list using the map
  const kurals = source.kural.map(item => {
    const number = item.Number;
    const meta = kuralMap.get(number) || {
      sect_tam: "Unknown",
      sect_eng: "Unknown",
      chapgrp_tam: "Unknown",
      chapgrp_eng: "Unknown",
      chap_tam: "Unknown",
      chap_eng: "Unknown"
    };

    return {
      number: number,
      sect_tam: meta.sect_tam,
      chapgrp_tam: meta.chapgrp_tam,
      chap_tam: meta.chap_tam,
      line1: item.Line1,
      line2: item.Line2,
      tam_exp: item.mv, // Using Mu. Varadarajan's explanation
      eng_exp: item.explanation,
      eng: item.Translation,
      sect_eng: meta.sect_eng,
      chapgrp_eng: meta.chapgrp_eng,
      chap_eng: meta.chap_eng
    };
  });

  console.log(`Transformed ${kurals.length} kurals with metadata.`);
  fs.writeFileSync(destPath, JSON.stringify(kurals, null, 2));
  
} catch (error) {
  console.error('Error transforming data:', error);
}