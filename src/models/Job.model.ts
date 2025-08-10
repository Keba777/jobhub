import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import User from "./User.model";
import Application from "./Application.model";

interface IJob {
    title: string;
    description: string;
    location?: string;
    status: "Draft" | "Open" | "Closed";
    createdBy: string;
    user?: User;
    applications?: Application[];
}

@Table({ tableName: "jobs", timestamps: true })
class Job extends Model<IJob> implements IJob {
    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        allowNull: false
    })
    id!: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: false
    })
    title!: string;

    @Column({
        type: DataType.STRING(2000),
        allowNull: false
    })
    description!: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: true
    })
    location?: string;

    @Column({
        type: DataType.ENUM("Draft", "Open", "Closed"),
        defaultValue: "Draft",
        allowNull: false
    })
    status!: "Draft" | "Open" | "Closed";

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false
    })
    createdBy!: string;

    @BelongsTo(() => User)
    user!: User;

    @HasMany(() => Application)
    applications!: Application[];
}

export default Job;