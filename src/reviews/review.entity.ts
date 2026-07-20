import { Transform } from "class-transformer";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { transformToLocalTime } from "../utils/constants";
import { Product } from "../products/product.entity";
import { User } from "../users/user.entity";
import type { WrapperType } from "../utils/wrapper.type";

@Entity("reviews")
export class Review {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "numeric", precision: 2, scale: 1 }) // e.g., 4.5/ precision 2 is total digits, scale means 1 after point
  rating!: number;

  @Column({ type: "text" })
  comment!: string;

  @CreateDateColumn({ type: "timestamptz" })
  @Transform(transformToLocalTime)
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  @Transform(transformToLocalTime)
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.reviews, {
    eager: true,
    onDelete: "CASCADE",
  }) //
  user?: WrapperType<User>;

  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: "CASCADE",
  }) // using eager here will cause circular serialization problem, becuase products loads reviews, and reviews loads product
  product?: WrapperType<Product>;
}
