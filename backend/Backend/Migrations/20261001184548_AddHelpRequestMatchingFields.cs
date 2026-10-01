using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddHelpRequestMatchingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "HelpRequests",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "ConsentGiven",
                table: "HelpRequests",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ContactMethod",
                table: "HelpRequests",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "ForFamilyMember",
                table: "HelpRequests",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SeniorName",
                table: "HelpRequests",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "HelpRequests",
                type: "text",
                nullable: false,
                defaultValue: "New");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "City",
                table: "HelpRequests");

            migrationBuilder.DropColumn(
                name: "ConsentGiven",
                table: "HelpRequests");

            migrationBuilder.DropColumn(
                name: "ContactMethod",
                table: "HelpRequests");

            migrationBuilder.DropColumn(
                name: "ForFamilyMember",
                table: "HelpRequests");

            migrationBuilder.DropColumn(
                name: "SeniorName",
                table: "HelpRequests");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "HelpRequests");
        }
    }
}
