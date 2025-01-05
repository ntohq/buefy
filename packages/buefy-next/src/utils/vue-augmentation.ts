// Resulting `vue-augmentation.d.ts` file of this file must be appended to
// `buefy.d.ts` after its generation, because `api-extractor` won't include the
// module augmentation in the rolled up output.
// https://github.com/microsoft/rushstack/issues/1709

// KEEP a SINGLE IMPORT statement in a SINGLE LINE,
// otherwise the post processing will be messed up.
import 'vue'

import type { LoadingProgrammatic } from '../components/loading'
import type { ModalProgrammatic } from '../components/modal'
import ConfigComponent from './ConfigComponent'

// Augments the global property with `$buefy`.
// https://vuejs.org/guide/typescript/options-api.html#augmenting-global-properties
declare module '@vue/runtime-core' {
    /** @public */
    interface ComponentCustomProperties {
        /** Global Buefy API. */
        $buefy: {
            config: typeof ConfigComponent,
            globalNoticeInterval?: ReturnType<typeof setTimeout>,
            loading: LoadingProgrammatic,
            modal: ModalProgrammatic,
            // TODO: make key-values more specific
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [key: string]: any
        }
    }
}
