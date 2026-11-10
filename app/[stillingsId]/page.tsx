import Stillingsside, { type StillingPageProps } from '../_felles/Stillingsside';
import { erVeileder } from '../_felles/utils/util';

export const dynamic = 'force-dynamic';

export { generateMetadata } from '../_felles/Stillingsside';

const StillingPage = ({ params }: StillingPageProps) => (
    <Stillingsside params={params} erVeileder={erVeileder} />
);

export default StillingPage;
