using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations.ListingsDb
{
    /// <inheritdoc />
    public partial class AddRegistrations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Registrations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    VolunteerId = table.Column<int>(type: "INTEGER", nullable: false),
                    VolunteerName = table.Column<string>(type: "TEXT", nullable: false),
                    VolunteerEmail = table.Column<string>(type: "TEXT", nullable: false),
                    ListingId = table.Column<int>(type: "INTEGER", nullable: false),
                    ListingTitle = table.Column<string>(type: "TEXT", nullable: false),
                    OrgName = table.Column<string>(type: "TEXT", nullable: false),
                    RegisteredAt = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Registrations", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Registrations");
        }
    }
}
