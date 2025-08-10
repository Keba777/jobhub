"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("applications", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      applicantId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      jobId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "jobs",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      resumeLink: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      coverLetter: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("Applied", "Reviewed", "Interview", "Rejected", "Hired"),
        defaultValue: "Applied",
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("applications");
  },
};