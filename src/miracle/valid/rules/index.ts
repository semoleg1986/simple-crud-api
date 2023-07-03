import { ValidationRule, PropertyValidationError } from '../index';

class Type implements ValidationRule {
  private readonly type: string;

  constructor(type: string) {
    this.type = type;
  }

  validateProperty(
    propertyName: string,
    propertyValue: any
  ): PropertyValidationError[] {
    if (typeof propertyValue !== this.type) {
      return [
        new PropertyValidationError(
          propertyName,
          `Property ${propertyName} must be of type ${this.type}.`
        )
      ];
    }

    return [];
  }
}

class IsRequired implements ValidationRule {
  // eslint-disable-next-line class-methods-use-this
  validateProperty(
    propertyName: string,
    propertyValue: any
  ): PropertyValidationError[] {
    if (propertyValue === undefined || propertyValue === null) {
      return [
        new PropertyValidationError(
          propertyName,
          `Property ${propertyName} is required.`
        )
      ];
    }

    return [];
  }
}

class ArrayItemRules implements ValidationRule {
  private readonly rules: ValidationRule[];

  constructor(rules: ValidationRule[]) {
    this.rules = rules;
  }

  validateProperty(
    propertyName: string,
    propertyValue: any
  ): PropertyValidationError[] {
    if (!Array.isArray(propertyValue)) {
      return [
        new PropertyValidationError(
          propertyName,
          `Property ${propertyName} must be an array.`
        )
      ];
    }

    let errors: PropertyValidationError[] = [];

    for (let i = 0; i < propertyValue.length; i += 1) {
      for (const rule of this.rules) {
        const ruleErrors = rule.validateProperty(
          `${propertyName}[${i}]`,
          propertyValue[i]
        );

        if (ruleErrors.length > 0) {
          errors = errors.concat(ruleErrors);
        }
      }
    }

    return errors;
  }
}

export { Type, IsRequired, ArrayItemRules };
