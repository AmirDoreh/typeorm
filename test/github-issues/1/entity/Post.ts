import {Entity} from "../../../../src/decorator/entity/Entity";
import {PrimaryGeneratedColumn} from "../../../../src/decorator/columns/PrimaryGeneratedColumn";
import {Column} from "../../../../src/decorator/columns/Column";
import {Scope} from "../../../../src/decorator/scopes/Scope";
import {SelectQueryBuilder} from "../../../../src/query-builder/SelectQueryBuilder";


@Entity()
export class Post {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    stage: string;

    @Column()
    views: number;

    @Scope(true)
    static isPublic(qb: SelectQueryBuilder<Post>): SelectQueryBuilder<Post> {
        return qb.andWhere('stage = :stage', {stage: 'public'});
    }

    @Scope()
    static isDraft(qb: SelectQueryBuilder<Post>): SelectQueryBuilder<Post> {
        return qb.andWhere('stage = :stage', {stage: 'draft'});
    }

    @Scope(true)
    static hasViewsAtLeast100(qb: SelectQueryBuilder<Post>): SelectQueryBuilder<Post> {
        return qb.andWhere('views >= :views', {views: 100});
    }
}