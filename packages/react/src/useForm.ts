import {
  CancelToken,
  ErrorValue,
  FormDataErrors,
  FormDataKeys,
  FormDataType,
  FormDataValues,
  Method,
  OptimisticCallback,
  Progress,
  RequestPayload,
  router,
  UrlMethodPair,
  UseFormArguments,
  UseFormSubmitArguments,
  UseFormSubmitOptions,
  UseFormTransformCallback,
  UseFormUtils,
  UseFormWithPrecognitionArguments,
  VisitOptions,
} from '@laraxgram/luna'
import { cloneDeep } from 'es-toolkit'
import type { NamedInputEvent, PrecognitionPath, ValidationConfig, Validator } from 'laravel-precognition'
import { useCallback, useMemo, useRef } from 'react'
import useFormState, { SetDataAction, SetDataByKeyValuePair, SetDataByMethod, SetDataByObject } from './useFormState'
import useRemember from './useRemember'

// Re-export types that were moved to useFormState
export { SetDataAction, SetDataByKeyValuePair, SetDataByMethod, SetDataByObject }

type PrecognitionValidationConfig<TKeys> = ValidationConfig & {
  only?: TKeys[] | Iterable<TKeys> | ArrayLike<TKeys>
}

export interface LunaFormProps<TForm extends Record<string, any>> {
  data: TForm
  isDirty: boolean
  errors: FormDataErrors<TForm>
  hasErrors: boolean
  processing: boolean
  progress: Progress | null
  wasSuccessful: boolean
  recentlySuccessful: boolean
  setData: SetDataAction<TForm>
  transform: (callback: UseFormTransformCallback<TForm>) => void
  setDefaults: {
    (): void
    <T extends FormDataKeys<TForm>>(field: T, value: FormDataValues<TForm, T>): void
    (fields: Partial<TForm>): void
  }
  reset: <K extends FormDataKeys<TForm>>(...fields: K[]) => void
  clearErrors: <K extends FormDataKeys<TForm>>(...fields: K[]) => void
  resetAndClearErrors: <K extends FormDataKeys<TForm>>(...fields: K[]) => void
  setError: {
    <K extends FormDataKeys<TForm>>(field: K, value: ErrorValue): void
    (errors: FormDataErrors<TForm>): void
  }
  submit: (...args: UseFormSubmitArguments) => void
  get: (url: string, options?: UseFormSubmitOptions) => void
  post: (url: string, options?: UseFormSubmitOptions) => void
  put: (url: string, options?: UseFormSubmitOptions) => void
  patch: (url: string, options?: UseFormSubmitOptions) => void
  delete: (url: string, options?: UseFormSubmitOptions) => void
  cancel: () => void
  dontRemember: <K extends FormDataKeys<TForm>>(...fields: K[]) => LunaFormProps<TForm>
  optimistic: <TProps>(callback: OptimisticCallback<TProps>) => LunaFormProps<TForm>
  withPrecognition: (...args: UseFormWithPrecognitionArguments) => LunaPrecognitiveFormProps<TForm>
}

export interface LunaFormValidationProps<TForm extends Record<string, any>> {
  invalid: <K extends FormDataKeys<TForm>>(field: K) => boolean
  setValidationTimeout: (duration: number) => LunaPrecognitiveFormProps<TForm>
  touch: <K extends FormDataKeys<TForm>>(
    field: K | NamedInputEvent | Array<K>,
    ...fields: K[]
  ) => LunaPrecognitiveFormProps<TForm>
  touched: <K extends FormDataKeys<TForm>>(field?: K) => boolean
  valid: <K extends FormDataKeys<TForm>>(field: K) => boolean
  validate: <K extends FormDataKeys<TForm> | PrecognitionPath<TForm>>(
    field?: K | NamedInputEvent | PrecognitionValidationConfig<K>,
    config?: PrecognitionValidationConfig<K>,
  ) => LunaPrecognitiveFormProps<TForm>
  validateFiles: () => LunaPrecognitiveFormProps<TForm>
  validating: boolean
  validator: () => Validator
  withAllErrors: () => LunaPrecognitiveFormProps<TForm>
  withoutFileValidation: () => LunaPrecognitiveFormProps<TForm>
  // Backward compatibility for easy migration from the original Precognition libraries
  setErrors: (errors: FormDataErrors<TForm>) => LunaPrecognitiveFormProps<TForm>
  forgetError: <K extends FormDataKeys<TForm> | NamedInputEvent>(field: K) => LunaPrecognitiveFormProps<TForm>
}

export type LunaForm<TForm extends Record<string, any>> = LunaFormProps<TForm>
export type LunaPrecognitiveFormProps<TForm extends Record<string, any>> = LunaFormProps<TForm> &
  LunaFormValidationProps<TForm>

export default function useForm<TForm extends FormDataType<TForm>>(
  method: Method | (() => Method),
  url: string | (() => string),
  data: TForm | (() => TForm),
): LunaPrecognitiveFormProps<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  urlMethodPair: UrlMethodPair | (() => UrlMethodPair),
  data: TForm | (() => TForm),
): LunaPrecognitiveFormProps<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  rememberKey: string,
  data: TForm | (() => TForm),
): LunaFormProps<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(data: TForm | (() => TForm)): LunaFormProps<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(): LunaFormProps<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  ...args: UseFormArguments<TForm>
): LunaFormProps<TForm> | LunaPrecognitiveFormProps<TForm> {
  const { rememberKey, data, precognitionEndpoint } = UseFormUtils.parseUseFormArguments<TForm>(...args)

  // Resolve initial data for remember functionality hooks
  const initialDefaults = typeof data === 'function' ? cloneDeep(data()) : cloneDeep(data)

  const cancelToken = useRef<CancelToken | null>(null)
  const excludeKeysRef = useRef<FormDataKeys<TForm>[]>([])
  const pendingOptimisticRef = useRef<OptimisticCallback | null>(null)

  // For remember functionality, we need custom state hooks
  const useDataState = rememberKey
    ? () => useRemember<TForm>(initialDefaults, `${rememberKey}:data`, excludeKeysRef)
    : undefined

  const useErrorsState = rememberKey
    ? () => useRemember<FormDataErrors<TForm>>({} as FormDataErrors<TForm>, `${rememberKey}:errors`)
    : undefined

  const {
    form: baseForm,
    setDefaultsState,
    transformRef,
    precognitionEndpointRef,
    dataRef,
    isMounted,
    setProcessing,
    setProgress,
    markAsSuccessful,
    clearErrors,
    setError,
    defaultsCalledInOnSuccessRef,
    resetBeforeSubmit,
    finishProcessing,
  } = useFormState<TForm>({
    data,
    precognitionEndpoint,
    useDataState,
    useErrorsState,
  })

  const submit = useCallback(
    (...args: UseFormSubmitArguments) => {
      const { method, url, options } = UseFormUtils.parseSubmitArguments(args, precognitionEndpointRef.current)

      defaultsCalledInOnSuccessRef.current = false

      const _options: VisitOptions = {
        ...options,
        onCancelToken: (token) => {
          cancelToken.current = token

          return options.onCancelToken?.(token)
        },
        onBefore: (visit) => {
          resetBeforeSubmit()

          return options.onBefore?.(visit)
        },
        onStart: (visit) => {
          setProcessing(true)

          return options.onStart?.(visit)
        },
        onProgress: (event) => {
          setProgress(event || null)

          return options.onProgress?.(event)
        },
        onSuccess: async (page) => {
          if (isMounted.current) {
            markAsSuccessful()
          }

          const onSuccess = options.onSuccess ? await options.onSuccess(page) : null

          if (isMounted.current && !defaultsCalledInOnSuccessRef.current) {
            baseForm.setData((data: TForm) => {
              setDefaultsState(cloneDeep(data))
              return data
            })
          }

          return onSuccess
        },
        onError: (errors) => {
          if (isMounted.current) {
            clearErrors()
            setError(errors as FormDataErrors<TForm>)
          }

          return options.onError?.(errors)
        },
        onCancel: () => {
          return options.onCancel?.()
        },
        onFinish: (visit) => {
          if (isMounted.current) {
            finishProcessing()
          }

          cancelToken.current = null

          return options.onFinish?.(visit)
        },
      }

      _options.optimistic = _options.optimistic ?? pendingOptimisticRef.current ?? undefined
      pendingOptimisticRef.current = null

      const transformedData = transformRef.current(dataRef.current) as RequestPayload

      if (method === 'delete') {
        router.delete(url, { ..._options, data: transformedData })
      } else {
        router[method](url, transformedData, _options)
      }
    },
    [clearErrors, setError, transformRef],
  )

  const cancel = useCallback(() => {
    if (cancelToken.current) {
      cancelToken.current.cancel()
    }
  }, [])

  const submitMethods = useMemo(
    () => ({
      get: (url: string, options: VisitOptions = {}) => submit('get', url, options),
      post: (url: string, options: VisitOptions = {}) => submit('post', url, options),
      put: (url: string, options: VisitOptions = {}) => submit('put', url, options),
      patch: (url: string, options: VisitOptions = {}) => submit('patch', url, options),
      delete: (url: string, options: VisitOptions = {}) => submit('delete', url, options),
    }),
    [submit],
  )

  // Add useForm-specific methods to the form object
  Object.assign(baseForm, {
    submit,
    ...submitMethods,
    cancel,
    dontRemember: <K extends FormDataKeys<TForm>>(...keys: K[]) => {
      excludeKeysRef.current = keys
      return form
    },

    optimistic: <TProps>(callback: OptimisticCallback<TProps>) => {
      pendingOptimisticRef.current = callback as OptimisticCallback
      return form
    },
  })

  // Cast to the full form type (baseForm now has submit methods)
  const form = baseForm as unknown as LunaFormProps<TForm>

  // Wrap withPrecognition to return the correct type with submit methods
  const originalWithPrecognition = baseForm.withPrecognition
  form.withPrecognition = (...args: UseFormWithPrecognitionArguments): LunaPrecognitiveFormProps<TForm> => {
    originalWithPrecognition(...args)
    return form as LunaPrecognitiveFormProps<TForm>
  }

  return precognitionEndpointRef.current ? (form as LunaPrecognitiveFormProps<TForm>) : form
}
