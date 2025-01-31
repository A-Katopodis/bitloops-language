import { BitloopsLanguageASTContext } from '../../index.js';
import { TBoundedContexts } from '../../types.js';
import { parseBitloops } from './BitloopsParser.js';
import BitloopsVisitor from './BitloopsVisitor/BitloopsVisitor.js';

export interface IBitloopsIntermediateASTParser {
  parse: (ast: BitloopsLanguageASTContext) => TBoundedContexts | BitloopsIntermediateASTParserError;
}

export class BitloopsIntermediateASTParserError extends Error {}

const migratedTypes = [
  'jestTestDeclaration',
  'controllerDeclaration',
  'dtoDeclaration',
  'propsDeclaration',
  'valueObjectDeclaration',
  'entityDeclaration',
  'aggregateDeclaration',
  'domainRuleDeclaration',
];

export class BitloopsIntermediateASTParser implements IBitloopsIntermediateASTParser {
  parse(ast: BitloopsLanguageASTContext): TBoundedContexts | BitloopsIntermediateASTParserError {
    let boundedContextsData: TBoundedContexts = {};
    let partialBoundedContextsData: TBoundedContexts = {};
    for (const [boundedContextName, boundedContext] of Object.entries(ast)) {
      for (const classes of Object.values(boundedContext)) {
        for (const classData of Object.values(classes)) {
          if (migratedTypes.includes(classData.deprecatedAST.type)) {
            const bitloopsVisitor = new BitloopsVisitor();
            // console.log('result::', bitloopsVisitor.visitChildren(classData.initialAST));
            const visitorModel = bitloopsVisitor.visit(classData.initialAST);
            partialBoundedContextsData = {
              [boundedContextName]: { [classData.module]: visitorModel },
            };
          } else {
            partialBoundedContextsData = parseBitloops(
              boundedContextName,
              classData.module,
              classData.deprecatedAST,
            );
          }
          boundedContextsData = mergeBoundedContextData(
            boundedContextsData,
            partialBoundedContextsData,
          );
        }
      }
    }
    return boundedContextsData;
  }
}

const mergeBoundedContextData = (
  mainBoundedContextData: TBoundedContexts,
  newBoundedContextData: TBoundedContexts,
): TBoundedContexts => {
  const result = { ...mainBoundedContextData };
  for (const [boundedContextName, boundedContextData] of Object.entries(newBoundedContextData)) {
    for (const [moduleName, moduleData] of Object.entries(boundedContextData)) {
      for (const [classType, classTypeData] of Object.entries(moduleData)) {
        for (const [className, classData] of Object.entries(classTypeData)) {
          if (classTypeExists(boundedContextName, moduleName, classType, result)) {
            result[boundedContextName][moduleName][classType][className] = classData;
          } else if (moduleExists(boundedContextName, moduleName, result)) {
            result[boundedContextName][moduleName][classType] = { [className]: classData };
          } else if (boundedContextExists(boundedContextName, result)) {
            result[boundedContextName][moduleName] = { [classType]: { [className]: classData } };
          } else {
            result[boundedContextName] = {
              [moduleName]: { [classType]: { [className]: classData } },
            };
          }
        }
      }
    }
  }
  return result;
};

const classTypeExists = (
  boundedContextName: string,
  moduleName: string,
  classType: string,
  boundedContextsData: TBoundedContexts,
): boolean => {
  return (
    boundedContextsData[boundedContextName] &&
    boundedContextsData[boundedContextName][moduleName] &&
    boundedContextsData[boundedContextName][moduleName][classType]
  );
};

const moduleExists = (
  boundedContextName: string,
  moduleName: string,
  boundedContextsData: TBoundedContexts,
): boolean => {
  return !!(
    boundedContextsData[boundedContextName] && boundedContextsData[boundedContextName][moduleName]
  );
};

const boundedContextExists = (
  boundedContextName: string,
  boundedContextsData: TBoundedContexts,
): boolean => {
  return !!boundedContextsData[boundedContextName];
};
