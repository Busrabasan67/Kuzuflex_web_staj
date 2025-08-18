"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = __importDefault(require("../data-source"));
const Solution_1 = require("../entity/Solution");
const SolutionExtraContent_1 = require("../entity/SolutionExtraContent");
const fixHasExtraContent = async () => {
    try {
        await data_source_1.default.initialize();
        console.log("Database connected");
        const solutionRepo = data_source_1.default.getRepository(Solution_1.Solution);
        const extraContentRepo = data_source_1.default.getRepository(SolutionExtraContent_1.SolutionExtraContent);
        // Tüm solution'ları al
        const solutions = await solutionRepo.find();
        console.log(`Found ${solutions.length} solutions`);
        for (const solution of solutions) {
            // Bu solution için ekstra içerik sayısını kontrol et
            const extraContentCount = await extraContentRepo.count({
                where: { solution: { id: solution.id } }
            });
            const shouldHaveExtraContent = extraContentCount > 0;
            const currentHasExtraContent = solution.hasExtraContent;
            console.log(`Solution ${solution.id} (${solution.slug}):`);
            console.log(`  - Current hasExtraContent: ${currentHasExtraContent}`);
            console.log(`  - Extra content count: ${extraContentCount}`);
            console.log(`  - Should have extra content: ${shouldHaveExtraContent}`);
            // Eğer farklıysa güncelle
            if (currentHasExtraContent !== shouldHaveExtraContent) {
                solution.hasExtraContent = shouldHaveExtraContent;
                await solutionRepo.save(solution);
                console.log(`  ✅ Updated hasExtraContent to ${shouldHaveExtraContent}`);
            }
            else {
                console.log(`  ✅ No change needed`);
            }
        }
        console.log("✅ All solutions updated successfully!");
        process.exit(0);
    }
    catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};
fixHasExtraContent();
