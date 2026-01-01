import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1767294285439 implements MigrationInterface {
    name = 'Migration1767294285439'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."characters_direction_enum" AS ENUM('0', '1', '2', '3')`);
        await queryRunner.query(`CREATE TABLE "characters" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "name" character varying(20) NOT NULL, "instancePath" character varying(100) NOT NULL, "x" double precision NOT NULL, "y" double precision NOT NULL, "direction" "public"."characters_direction_enum" NOT NULL DEFAULT '1', "userId" uuid NOT NULL, CONSTRAINT "UQ_86a2bcc85e3473ecf3693dfe5a1" UNIQUE ("name"), CONSTRAINT "PK_9d731e05758f26b9315dac5e378" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_86a2bcc85e3473ecf3693dfe5a" ON "characters" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_7c1bf02092d401b55ecc243ef1" ON "characters" ("userId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_7c1bf02092d401b55ecc243ef1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_86a2bcc85e3473ecf3693dfe5a"`);
        await queryRunner.query(`DROP TABLE "characters"`);
        await queryRunner.query(`DROP TYPE "public"."characters_direction_enum"`);
    }

}
