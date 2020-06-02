import {Entity} from "../../../../src/decorator/entity/Entity";
import {PrimaryGeneratedColumn} from "../../../../src/decorator/columns/PrimaryGeneratedColumn";
import {Column} from "../../../../src/decorator/columns/Column";
import {ManyToOne} from "../../../../src/decorator/relations/ManyToOne";
import {BaseEntity} from "../../../../src/repository/BaseEntity";
import {Video} from './Video';
import {Image} from './Image';

type Commentable = Video | Image;

@Entity()
export class Comment extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @ManyToOne(type => Video, video => video.comments)
    commentableVideo: Video | null;

    @ManyToOne(type => Image, image => image.comments)
    commentableImage: Image | null;

    get commentable(): Commentable {
        console.log('get commentable')
        console.log(this.commentableVideo, this.commentableImage)
        const commentable = this.commentableVideo || this.commentableImage;
        if (!commentable) {
            throw new Error('All commentable objects is null');
        }
        return commentable;
    }
    set commentable(commentable: Commentable) {
        console.log('set commentable')
        this.commentableVideo = null;
        this.commentableImage = null;
        if (commentable instanceof Video) {
            this.commentableVideo = commentable;
        } else if (commentable instanceof Image) {
            this.commentableImage = commentable;
        } else {
            throw new Error('commentable does not belong to any type of commentable objects');
        }
    }
}