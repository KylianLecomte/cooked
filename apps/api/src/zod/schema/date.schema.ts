import z from "zod";

export const dateSchema = z.iso.date("Invalid date format");
export const uuidSchema = z.uuid();
