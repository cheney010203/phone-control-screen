import { describe, expect, it } from "@jest/globals";

import type { ValueOrPromise } from "../utils.js";

import { StructFieldDefinition } from "./definition.js";
import type { StructFieldValue } from "./field-value.js";
import type { StructOptions } from "./options.js";
import type { AsyncExactReadable, ExactReadable } from "./stream.js";
import type { StructValue } from "./struct-value.js";

describe("StructFieldDefinition", () => {
    describe(".constructor", () => {
        it("should save the `options` parameter", () => {
            class MockFieldDefinition extends StructFieldDefinition<number> {
                constructor(options: number) {
                    super(options);
                }
                getSize(): number {
                    throw new Error("Method not implemented.");
                }
                create(
                    options: Readonly<StructOptions>,
                    struct: StructValue,
                    value: unknown,
                ): StructFieldValue<this> {
                    void options;
                    void struct;
                    void value;
                    throw new Error("Method not implemented.");
                }
                override deserialize(
                    options: Readonly<StructOptions>,
                    stream: ExactReadable,
                    struct: StructValue,
                ): StructFieldValue<this>;
                override deserialize(
                    options: Readonly<StructOptions>,
                    stream: AsyncExactReadable,
                    struct: StructValue,
                ): Promise<StructFieldValue<this>>;
                deserialize(
                    options: Readonly<StructOptions>,
                    stream: ExactReadable | AsyncExactReadable,
                    struct: StructValue,
                ): ValueOrPromise<StructFieldValue<this>> {
                    void options;
                    void stream;
                    void struct;
                    throw new Error("Method not implemented.");
                }
            }

            expect(new MockFieldDefinition(42)).toHaveProperty("options", 42);
        });
    });
});
