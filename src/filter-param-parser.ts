import parser = require("./parser");
import { OperatorsConfig, FieldExpression, finalizeFieldExpression } from './helpers';

/**
 * Takes a set of operator descriptions for operators that are all legal in
 * the filter query string, and the value of the filter query parameter, and
 * returns a parsed set of filters.
 *
 * Fundamentally, this invokes our generic parser (from grammar.pegjs) and then
 * validates/transforms the list results into FieldExpressions based on the
 * specific rules for the filter param and the user provided finalizeArgs fns.
 *
 * @param {OperatorsConfig} filterOperators Operators allowed in ?filter.
 * @param {string} filterVal The value for ?filter.
 * @throws {Error} If any of the input is invalid.
 */
export default function parse(
  filterOperators: OperatorsConfig,
  filterVal: string
): (FieldExpression)[] {
  const constraintLists = parser.parse(filterVal, { startRule: "Filter" });
  const toFieldExpression = finalizeFieldExpression(filterOperators);

  // Process each filter expression.
  return constraintLists.map(function toFinalExp(rawExp): FieldExpression {
    const exp = toFieldExpression(rawExp);

    // If the arguments in this expression contain other unprocessed
    // field expressions, recursively finalize them, so we're not leaking
    // unusable, proprietary-format RawFieldExpressions back to the consumer.
    const finalArgs = filterOperators[exp.operator]!.finalizeArgs(
      filterOperators,
      exp.operator,
      exp.args.map((arg: any) => {
        if(arg && arg.type === 'RawFieldExpression') {
          return toFinalExp(arg);
        }

        return arg;
      })
    );

    return {
      ...exp,
      args: finalArgs
    }
  });
}