import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Transform } from "class-transformer";

import { transformToLocalTime } from "../utils/constants";
import { Review } from "../reviews/review.entity";
import { User } from "../users/user.entity";
import type { WrapperType } from "../utils/wrapper.type";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 150 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column({ type: "numeric", precision: 10, scale: 2 }) // precision is the total number of digits, scale is the number of digits after the decimal point.
  price!: number;

  @CreateDateColumn({ type: "timestamptz" }) // timestamptz is a type of timestamp that includes timezone information.
  @Transform(transformToLocalTime)
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  @Transform(transformToLocalTime)
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.products, { eager: true }) // many products can have one user
  user?: WrapperType<User>; // WrapperType prevents SWC from eagerly resolving the circular import in decorator metadata

  @OneToMany(() => Review, (review) => review.product, { eager: true }) // eager: true means that the relation will be loaded automatically when the entity is loaded.
  reviews?: WrapperType<Review[]>;
}
