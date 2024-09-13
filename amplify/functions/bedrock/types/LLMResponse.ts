export type Type =
    "WORKAROUND" |
    "CLARIFYING_QUESTIONS" |
    "UNABLE_TO_ANSWER" |
    "SOLVED" |
    "INAPPROPRIATE";

export interface Response {
    type: Type;
    response: string;
}