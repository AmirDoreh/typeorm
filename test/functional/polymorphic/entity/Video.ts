import {Entity} from "../../../../src/decorator/entity/Entity";
import {PrimaryGeneratedColumn} from "../../../../src/decorator/columns/PrimaryGeneratedColumn";
import {Column} from "../../../../src/decorator/columns/Column";
import {OneToMany} from "../../../../src/decorator/relations/OneToMany";
import {BaseEntity} from "../../../../src/repository/BaseEntity";
import {Comment} from './Comment';

@Entity()
export class Video extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    videoURL: string;

    @OneToMany(type => Comment, comment => comment.commentableVideo)
    comments: Comment[];

}