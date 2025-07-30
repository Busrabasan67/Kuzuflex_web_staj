import AppDataSource from "../data-source";
import { Solution } from "../entity/Solution";
import { SolutionExtraContent } from "../entity/SolutionExtraContent";

const fixHasExtraContent = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected");

    const solutionRepo = AppDataSource.getRepository(Solution);
    const extraContentRepo = AppDataSource.getRepository(SolutionExtraContent);

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
      } else {
        console.log(`  ✅ No change needed`);
      }
    }

    console.log("✅ All solutions updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

fixHasExtraContent(); 