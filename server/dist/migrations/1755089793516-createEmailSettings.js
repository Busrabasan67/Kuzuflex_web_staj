"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEmailSettings1755089793516 = void 0;
class CreateEmailSettings1755089793516 {
    constructor() {
        this.name = 'CreateEmailSettings1755089793516';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "email_settings" ("id" int NOT NULL IDENTITY(1,1), "smtpHost" nvarchar(255) NOT NULL CONSTRAINT "DF_400833eaf36bc3469d2c032a0f8" DEFAULT 'smtp.office365.com', "smtpPort" int NOT NULL CONSTRAINT "DF_3fab4bc39759accf7c3d350743f" DEFAULT 587, "encryption" nvarchar(255) NOT NULL CONSTRAINT "DF_d72db56be3df123329d5f5fbbaa" DEFAULT 'TLS', "authentication" bit NOT NULL CONSTRAINT "DF_cf5fc03f7caa773a2977c135f3f" DEFAULT 1, "smtpUsername" nvarchar(255) NOT NULL CONSTRAINT "DF_7e72f8e1b70962a3a7d9571bd5b" DEFAULT 'wifi@kuzuflex.com', "smtpPassword" nvarchar(255), "contactFormRecipient" nvarchar(255) NOT NULL CONSTRAINT "DF_35759a8c4925f8fc9eb108bd10a" DEFAULT 'bilgiislem@kuzuflex.com', "germanyEmail" nvarchar(255) NOT NULL CONSTRAINT "DF_c30fceb62499aa0768147b0f861" DEFAULT 'bilgiislem@kuzuflex.com', "mailFrom" nvarchar(255) NOT NULL CONSTRAINT "DF_d2167a30b5c660dd5758e5d57e1" DEFAULT 'wifi@kuzuflex.com', "createdAt" datetime2 NOT NULL CONSTRAINT "DF_77a93a9bc80b38c3ff1e6acbd11" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_87d100039e90b53684458f6a0e5" DEFAULT getdate(), CONSTRAINT "PK_d363efbb6aa1c747440c0ec24f4" PRIMARY KEY ("id"))`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "email_settings"`);
    }
}
exports.CreateEmailSettings1755089793516 = CreateEmailSettings1755089793516;
