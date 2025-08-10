import { Column, DataType, Model, PrimaryKey, Table } from "sequelize-typescript";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

interface IUser {
    name: string;
    email: string;
    password: string;
    role: "applicant" | "company";
    isVerified?: boolean;
}

@Table({ tableName: "users", timestamps: true })
class User extends Model<IUser> implements IUser {
    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        allowNull: false,
    })
    id!: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: false
    })
    name!: string;

    @Column({
        type: DataType.STRING(100),
        unique: true,
        allowNull: false
    })
    email!: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false
    })
    password!: string;

    @Column({
        type: DataType.ENUM("applicant", "company"),
        allowNull: false
    })
    role!: "applicant" | "company";

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    isVerified!: boolean;

    async matchPassword(enteredPassword: string) {
        return await bcrypt.compare(enteredPassword, this.password);
    }

    getSignedJwtToken() {
        return jwt.sign(
            { id: this.id, role: this.role },
            process.env.JWT_SECRET || "secret",
            {
                expiresIn: process.env.JWT_EXPIRE
                    ? parseInt(process.env.JWT_EXPIRE)
                    : "1d",
            }
        );
    }
}

export default User;