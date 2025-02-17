import { GetServerSideProps } from 'next';
import Head from 'next/head';

import AllJourneyInstancesLayout from 'features/journeys/layout/AllJourneyInstancesLayout';
import getOrg from 'utils/fetching/getOrg';
import JourneyInstanceCreateFab from 'features/journeys/components/JourneyInstanceCreateFab';
import JourneyInstancesDataTable from 'features/journeys/components/JourneyInstancesDataTable';
import { PageWithLayout } from 'utils/types';
import { scaffold } from 'utils/next';
import { ZetkinJourney } from 'utils/types/zetkin';
import ZUIQuery from 'zui/ZUIQuery';
import {
  journeyInstancesResource,
  journeyResource,
} from 'features/journeys/api/journeys';

const scaffoldOptions = {
  authLevelRequired: 2,
  localeScope: ['layout.organize', 'pages.organizeJourney'],
};

export const getServerSideProps: GetServerSideProps = scaffold(async (ctx) => {
  const { orgId, journeyId } = ctx.params!;

  await ctx.queryClient.prefetchQuery(
    ['org', orgId],
    getOrg(orgId as string, ctx.apiFetch)
  );
  const orgState = ctx.queryClient.getQueryState(['org', orgId]);

  const { state: journeyQueryState } = await journeyResource(
    orgId as string,
    journeyId as string
  ).prefetch(ctx);

  if (
    orgState?.status === 'success' &&
    journeyQueryState?.status === 'success'
  ) {
    return {
      props: {
        journeyId,
        orgId,
      },
    };
  } else {
    return {
      notFound: true,
    };
  }
}, scaffoldOptions);

type ClosedJourneyInstancesPageProps = {
  journeyId: string;
  orgId: string;
};

const ClosedJourneyInstancesPage: PageWithLayout<
  ClosedJourneyInstancesPageProps
> = ({ orgId, journeyId }) => {
  const journeyQuery = journeyResource(orgId, journeyId).useQuery();
  const journeyInstancesQuery = journeyInstancesResource(
    orgId,
    journeyId
  ).useQuery();
  const journey = journeyQuery.data as ZetkinJourney;

  return (
    <>
      <Head>
        <title>{journey.plural_label}</title>
      </Head>
      <ZUIQuery queries={{ journeyInstancesQuery }}>
        {({ queries: { journeyInstancesQuery } }) => {
          const openJourneyInstances =
            journeyInstancesQuery.data.journeyInstances.filter(
              (journeyInstance) => Boolean(journeyInstance.closed)
            );

          return (
            <JourneyInstancesDataTable
              journeyInstances={openJourneyInstances}
              storageKey={`journeyInstances-${journey.id}-closed`}
              tagColumnsData={journeyInstancesQuery.data.tagColumnsData}
            />
          );
        }}
      </ZUIQuery>
      <JourneyInstanceCreateFab />
    </>
  );
};

ClosedJourneyInstancesPage.getLayout = function getLayout(page) {
  return (
    <AllJourneyInstancesLayout fixedHeight>{page}</AllJourneyInstancesLayout>
  );
};

export default ClosedJourneyInstancesPage;
