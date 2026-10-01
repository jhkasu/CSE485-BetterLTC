using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddVolunteerMatchingProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<List<string>>(
                name: "AvailableDays",
                table: "Volunteers",
                type: "text[]",
                nullable: false,
                defaultValueSql: "'{}'::text[]");

            migrationBuilder.AddColumn<List<string>>(
                name: "AvailableTimes",
                table: "Volunteers",
                type: "text[]",
                nullable: false,
                defaultValueSql: "'{}'::text[]");

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Volunteers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<List<string>>(
                name: "Interests",
                table: "Volunteers",
                type: "text[]",
                nullable: false,
                defaultValueSql: "'{}'::text[]");

            migrationBuilder.AddColumn<List<string>>(
                name: "Languages",
                table: "Volunteers",
                type: "text[]",
                nullable: false,
                defaultValueSql: "'{}'::text[]");

            migrationBuilder.AddColumn<bool>(
                name: "RecommendationConsent",
                table: "Volunteers",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvailableDays",
                table: "Volunteers");

            migrationBuilder.DropColumn(
                name: "AvailableTimes",
                table: "Volunteers");

            migrationBuilder.DropColumn(
                name: "City",
                table: "Volunteers");

            migrationBuilder.DropColumn(
                name: "Interests",
                table: "Volunteers");

            migrationBuilder.DropColumn(
                name: "Languages",
                table: "Volunteers");

            migrationBuilder.DropColumn(
                name: "RecommendationConsent",
                table: "Volunteers");
        }
    }
}
