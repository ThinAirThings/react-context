import { ReactNode, RefObject, createContext, useContext, useMemo, useRef } from "react";
import { Updater, useImmer } from "use-immer";
export const createContextState = <T,>(
    initialValue: T,
): [
    ({ 
        children 
    }: {
        children: ReactNode;
    }) => JSX.Element, 
    () => [T, Updater<T>]
] => {
    // Folder Context
    const Context = createContext<[T, Updater<T>]>([initialValue, () => {}])
    const ContextProvider = ({
        children
    }: {
        children: ReactNode
    }) => {
        const [state, setState] = useImmer(initialValue)
        const contextValue = useMemo<[T, Updater<T>]>(() => {
            return [state, setState]
        }, [state])
        return (
            <Context.Provider value={contextValue}>
                {children}
            </Context.Provider>
        )
    }

    const useCustomContext = () => {
        return useContext(Context)
    }
    return [ContextProvider, useCustomContext]
}

export const createContextRef = <T,>(): [
    ({
        children
    }: {
        children: ReactNode
    }) => JSX.Element,
    () => [RefObject<T>|null, ()=>void]
] => {
    // Create Context Object
    const Context = createContext<[RefObject<T>|null, ()=>void]>([null, ()=>{}])
    const ContextProvider = ({
        children
    }: {
        children: ReactNode
    }) => {
        const ref = useRef<T>(null)
        return (
            <Context.Provider value={[ref, ()=>{}]}>
                {children}
            </Context.Provider>
        )
    }
    const useCustomContext = () => {
        return useContext(Context)
    }
    return [ContextProvider, useCustomContext]
}

export const createContextExports = <ContextType extends Record<string, any>>(context: ContextType) => {
  return Object.entries(context).reduce((acc, [key, [_, useContextState]]) => {
    return {
      ...acc,
      ["use" + (key.charAt(0).toUpperCase() + key.slice(1))]: useContextState,
    };
  }, {} as {
    [Property in keyof ContextType as `use${Capitalize<string & Property>}`]: ContextType[Property][1];
  });
};

export const createContextProviderComposition = <ContextType extends Record<string, any>>(
    context: ContextType, 
    InnerComponent?:({children}: {children: ReactNode})=>JSX.Element
) => {
    return ({children}: {children: ReactNode}) => Object.values(context).reduceRight((prev, ContextRow) => {
        const [ContextProvider] = ContextRow
        return <ContextProvider>{prev}</ContextProvider>
    }, InnerComponent?<InnerComponent>{children}</InnerComponent>:<>{children}</>)
}