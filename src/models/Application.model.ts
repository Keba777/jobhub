import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import User from "./User.model";
import Job from "./Job.model";

interface IApplication {
    applicantId: string;
    jobId: string;
    resumeLink: string;
    coverLetter?: string;
    status: "Applied" | "Reviewed" | "Interview" | "Rejected" | "Hired";
    applicant?: User;
    job?: Job;
}

@Table({ tableName: "applications", timestamps: true })
class Application extends Model<IApplication> implements IApplication {
    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        allowNull: false
    })
    id!: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false
    })
    applicantId!: string;

    @ForeignKey(() => Job)
    @Column({
        type: DataType.UUID,
        allowNull: false
    })
    jobId!: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false
    })
    resumeLink!: string;

    @Column({
        type: DataType.STRING(200),
        allowNull: true
    })
    coverLetter?: string;

    @Column({
        type: DataType.ENUM("Applied", "Reviewed", "Interview", "Rejected", "Hired"),
        defaultValue: "Applied",
        allowNull: false
    })
    status!: "Applied" | "Reviewed" | "Interview" | "Rejected" | "Hired";

    @BelongsTo(() => User)
    applicant!: User;

    @BelongsTo(() => Job)
    job!: Job;
}

export default Application;