# Scope

* [What is the Scope?](https://api.rubyonrails.org/classes/ActiveRecord/Scoping/Named/ClassMethods.html)
* [What is the Global/Default Scope?](https://apidock.com/rails/ActiveRecord/Base/default_scope/class)

## Features
- Support scopes, global/default scopes and unscoped
- But only support in **select** operations
  - `createQueryBuilder()` (this is a `SelectQueryBuilder`)
  - Repository/Entity's `find`, `findOne`, `findByIds`, `count`, etc.
- Not support in create, update and delete operations

## Usage in SelectQueryBuilder

### Basic

```typescript
import {BaseEntity, Entity, PrimaryGeneratedColumn, Column, Scope, SelectQueryBuilder} from "typeorm";

@Entity()
class Post extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    stage: string;

    @Scope(true)
    static isPublic(qb: SelectQueryBuilder<Post>): SelectQueryBuilder<Post> {
        return qb.andWhere('stage = :stage', {stage: 'public'});
    }
}

const posts = await postRepository
    .createQueryBuilder("post")
    .getMany();
// query: SELECT ... WHERE stage = ? -- PARAMETERS: ["public"]
```
In the above example, we define a **static** function `isPublic`. It's passed one argument `qb: SelectQueryBuilder<Entity>`. We can add as many operations as we want such as `andWhere`, `groupBy`, `limit` to the qb. Anything `SelectQueryBuilder` and `QueryBuilder` support will be okay. Finally, return qb itself.

Then add `@Scope()` decorator to the function to indicate it as a scope function. `@Scope(true)` means it's a global scope which will be executed automatically in any select operation.

### Unscoped
```typescript
const posts = await postRepository
    .unscoped()
    .getMany();
```

`unscoped()` to the QueryBuilder to disable global scopes.

### Add scopes to the query
```typescript
class Post extends BaseEntity {
    // ...

    @Scope()
    static isDraft(qb: SelectQueryBuilder<Post>): SelectQueryBuilder<Post> {
        return qb.andWhere('stage = :stage', {stage: 'draft'});
    }
}

const posts = await postRepository
    .scope(Post.isDraft)
    .getMany();
```
`isDraft` is not a global scope, but we can add it by calling `.scope(<Entity.MyScope>)`.  
`.scope()` accepts one scope or an array of scopes. For example, `.scope([Post.isDraft, Post.popular])` is okay.


See more examples [here](test/functional/scopes/scope-query-builder.ts)

## Usage in Active Record

```typescript
const posts = await postRepository
    .find({
        unscoped: true,
        scope: Post.isDraft, // or [Post.isDraft]
    });
```
See more examples [here](test/functional/scopes/scope-find.ts)