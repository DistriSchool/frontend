export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import VerifyEmailClient from './VerifyEmailClient'

const Page = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailClient />
        </Suspense>
    )
}

export default Page
