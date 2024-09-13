export const filter = (comments: any[]) => {
    return (predicate: (comment: any) => boolean) => comments.filter(predicate).map(comment => comment.body);
}