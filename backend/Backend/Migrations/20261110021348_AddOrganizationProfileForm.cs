using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddOrganizationProfileForm : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdditionalLocations",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "AdminComments",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CategoryOther",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CommunitiesServed",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "ConsentedAt",
                table: "Organizations",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactPhone",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ContactPosition",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CoreValues",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<List<string>>(
                name: "EngagementInterests",
                table: "Organizations",
                type: "text[]",
                nullable: false,
                defaultValueSql: "'{}'::text[]");

            migrationBuilder.AddColumn<string>(
                name: "Facebook",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<List<string>>(
                name: "GeographicScope",
                table: "Organizations",
                type: "text[]",
                nullable: false,
                defaultValueSql: "'{}'::text[]");

            migrationBuilder.AddColumn<string>(
                name: "Goals",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Instagram",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LanguageServices",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LegalName",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LinkedIn",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Mission",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OrgType",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OrgTypeOther",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OtherSocial",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PopulationOther",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<List<string>>(
                name: "PopulationsServed",
                table: "Organizations",
                type: "text[]",
                nullable: false,
                defaultValueSql: "'{}'::text[]");

            migrationBuilder.AddColumn<string>(
                name: "PostalCode",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Province",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "RepresentativeName",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ReviewFrequency",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ServiceLanguageOther",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<List<string>>(
                name: "ServiceLanguages",
                table: "Organizations",
                type: "text[]",
                nullable: false,
                defaultValueSql: "'{}'::text[]");

            migrationBuilder.AddColumn<string>(
                name: "ShortDescription",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Story",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "StreetAddress",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Tagline",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TikTok",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Uniqueness",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UpdateContact",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UpdateContactDetails",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Vision",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "YearEstablished",
                table: "Organizations",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "YouTube",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql("UPDATE \"Organizations\" SET \"CategoryOther\" = 'Community Services' WHERE \"Categories\" @> ARRAY['Community Services']");
            migrationBuilder.Sql("UPDATE \"Organizations\" SET \"Categories\" = ARRAY(SELECT DISTINCT CASE c WHEN 'Health' THEN 'Health Care and Wellness' WHEN 'Seniors Services' THEN 'Seniors and Healthy Aging' WHEN 'Youth' THEN 'Children and Youth' WHEN 'Education' THEN 'Education and Literacy' WHEN 'Environment' THEN 'Environment and Sustainability' WHEN 'Arts and Culture' THEN 'Arts, Culture and Heritage' WHEN 'Community Services' THEN 'Other' ELSE c END FROM unnest(\"Categories\") AS c)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE \"Organizations\" SET \"Categories\" = ARRAY(SELECT DISTINCT CASE c WHEN 'Health Care and Wellness' THEN 'Health' WHEN 'Seniors and Healthy Aging' THEN 'Seniors Services' WHEN 'Children and Youth' THEN 'Youth' WHEN 'Education and Literacy' THEN 'Education' WHEN 'Environment and Sustainability' THEN 'Environment' WHEN 'Arts, Culture and Heritage' THEN 'Arts and Culture' ELSE 'Other' END FROM unnest(\"Categories\") AS c)");

            migrationBuilder.DropColumn(
                name: "AdditionalLocations",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "AdminComments",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "CategoryOther",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "City",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "CommunitiesServed",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "ConsentedAt",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "ContactPhone",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "ContactPosition",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "CoreValues",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "EngagementInterests",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "Facebook",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "GeographicScope",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "Goals",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "Instagram",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "LanguageServices",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "LegalName",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "LinkedIn",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "Mission",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "OrgType",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "OrgTypeOther",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "OtherSocial",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "PopulationOther",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "PopulationsServed",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "PostalCode",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "Province",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "RepresentativeName",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "ReviewFrequency",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "ServiceLanguageOther",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "ServiceLanguages",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "ShortDescription",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "Story",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "StreetAddress",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "Tagline",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "TikTok",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "Uniqueness",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "UpdateContact",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "UpdateContactDetails",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "Vision",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "YearEstablished",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "YouTube",
                table: "Organizations");
        }
    }
}
