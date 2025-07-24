import bcrypt from "bcrypt";

const plainPassword = "123456"; // burada gerçek şifreni yaz
const hashed = bcrypt.hashSync(plainPassword, 10);

console.log("Yeni Hashli şifre:", hashed);

// Mevcut hash'i test et
const currentHash = "$2b$10$F9v7HlM9uPns2WldXu2v0.R5xQqlXYw3yMKxDR5pZOLIUkNRqEyUG";
const isCurrentHashCorrect = bcrypt.compareSync("123456", currentHash);
console.log("Mevcut hash doğru mu?", isCurrentHashCorrect);

// Yeni hash'i test et  
const isNewHashCorrect = bcrypt.compareSync("123456", hashed);
console.log("Yeni hash doğru mu?", isNewHashCorrect);
