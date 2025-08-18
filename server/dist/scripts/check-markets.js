"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/scripts/check-markets.ts
const data_source_1 = __importDefault(require("../data-source"));
const Market_1 = require("../entity/Market");
const run = async () => {
    await data_source_1.default.initialize();
    const marketRepo = data_source_1.default.getRepository(Market_1.Market);
    try {
        console.log("🔍 Markets tablosundaki veriler kontrol ediliyor...");
        const markets = await marketRepo.find({
            relations: ['translations']
        });
        console.log(`📊 Toplam ${markets.length} market bulundu:`);
        markets.forEach((market, index) => {
            console.log(`\n${index + 1}. Market ID: ${market.id}`);
            console.log(`   Slug: ${market.slug}`);
            console.log(`   ImageUrl: ${market.imageUrl}`);
            console.log(`   Order: ${market.order}`);
            console.log(`   IsActive: ${market.isActive}`);
            console.log(`   HasProducts: ${market.hasProducts}`);
            console.log(`   HasSolutions: ${market.hasSolutions}`);
            console.log(`   HasCertificates: ${market.hasCertificates}`);
            if (market.translations && market.translations.length > 0) {
                console.log(`   Translations:`);
                market.translations.forEach(trans => {
                    console.log(`     ${trans.language}: ${trans.name} - ${trans.description?.substring(0, 50)}...`);
                });
            }
            else {
                console.log(`   ❌ Translations yok!`);
            }
        });
        // Gas Application'ı özel olarak kontrol et
        const gasMarket = markets.find(m => m.slug === 'gas-applications');
        if (gasMarket) {
            console.log(`\n🔥 GAS APPLICATION DETAYI:`);
            console.log(`   ID: ${gasMarket.id}`);
            console.log(`   Slug: ${gasMarket.slug}`);
            console.log(`   ImageUrl: ${gasMarket.imageUrl}`);
            console.log(`   Full ImageUrl: http://localhost:5000${gasMarket.imageUrl}`);
            if (gasMarket.translations && gasMarket.translations.length > 0) {
                gasMarket.translations.forEach(trans => {
                    console.log(`   ${trans.language}: ${trans.name} - ${trans.description}`);
                });
            }
        }
        else {
            console.log(`\n❌ Gas Application market bulunamadı!`);
        }
    }
    catch (error) {
        console.error("❌ Hata:", error);
    }
    finally {
        await data_source_1.default.destroy();
    }
};
run();
