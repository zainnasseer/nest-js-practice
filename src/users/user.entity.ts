import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Exclude, Transform } from "class-transformer";

import { Product } from "../products/product.entity";
import { transformToLocalTime } from "../utils/constants";
import { Review } from "../reviews/review.entity";
import { UserTypeEnum } from "../utils/enums";
import type { WrapperType } from "../utils/wrapper.type";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 50, nullable: true }) // varchar: database will only allocate space for the actual characters stored, plus 1 or 2 bytes to record the length.
  username!: string;

  @Column({ type: "varchar", length: 150, unique: true }) //
  email!: string;

  @Column()
  @Exclude() // hide this field from the response
  password!: string;

  @Column({ type: "enum", enum: UserTypeEnum, default: UserTypeEnum.USER })
  userType!: UserTypeEnum;

  @Column({ type: "boolean", default: false })
  isAccountVerified!: boolean;

  @Column({ nullable: true, type: "varchar" })
  verificationToken!: string | null;

  @Column({ nullable: true, type: "varchar" })
  resetPasswordToken!: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  @Transform(transformToLocalTime)
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  @Transform(transformToLocalTime)
  updatedAt!: Date;

  @Column({ nullable: true, default: null, type: "varchar" })
  profileImage!: string | null;

  // DB RELATIONS
  //() => Product, is a function that returns the target entity class (Product).
  //  TypeORM uses a callback function here rather than passing the class directly (Product)
  //  to prevent circular dependency bugs
  @OneToMany(() => Product, (product) => product.user) //(product) => product.user tells TypeORM how the Product entity maps back to the User.
  products?: WrapperType<Product[]>;

  @OneToMany(() => Review, (review) => review.user)
  reviews?: WrapperType<Review[]>;
}
