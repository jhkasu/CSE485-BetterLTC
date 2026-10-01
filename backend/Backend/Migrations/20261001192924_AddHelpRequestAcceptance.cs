using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddHelpRequestAcceptance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "AcceptedAt",
                table: "HelpRequests",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ContactedAt",
                table: "HelpRequests",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OrganizationId",
                table: "HelpRequests",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_HelpRequests_OrganizationId",
                table: "HelpRequests",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_HelpRequests_Status",
                table: "HelpRequests",
                column: "Status");

            migrationBuilder.AddForeignKey(
                name: "FK_HelpRequests_Organizations_OrganizationId",
                table: "HelpRequests",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_HelpRequests_Organizations_OrganizationId",
                table: "HelpRequests");

            migrationBuilder.DropIndex(
                name: "IX_HelpRequests_OrganizationId",
                table: "HelpRequests");

            migrationBuilder.DropIndex(
                name: "IX_HelpRequests_Status",
                table: "HelpRequests");

            migrationBuilder.DropColumn(
                name: "AcceptedAt",
                table: "HelpRequests");

            migrationBuilder.DropColumn(
                name: "ContactedAt",
                table: "HelpRequests");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "HelpRequests");
        }
    }
}
