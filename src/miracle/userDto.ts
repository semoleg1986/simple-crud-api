import { ValidationRule } from './valid/';
import { Type, ArrayItemRules, IsRequired } from './valid/rules';

type CreateUserDto = {
  username: string;
  age: number;
  hobbies: string[];
};

type UpdateUserDto = CreateUserDto;

const validationRules: Record<keyof CreateUserDto, ValidationRule[]> = {
  username: [new IsRequired(), new Type('string')],
  age: [new IsRequired(), new Type('number')],
  hobbies: [new IsRequired(), new ArrayItemRules([new Type('string')])]
};

export { CreateUserDto, UpdateUserDto, validationRules };
