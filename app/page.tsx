import GameBoard from './components/game-board';
import { getRandomCards } from './actions/get-cards';
import { getCardsForTopic, getMyTopics } from './actions/topics';

export const dynamic = 'force-dynamic';

interface HomeProps {
  searchParams: Promise<{ topic?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { topic } = await searchParams;
  const topics = await getMyTopics();

  const selectedTopicId = topic ? Number(topic) : null;
  const isCustomTopic =
    selectedTopicId !== null && topics.some((t) => t.id === selectedTopicId);

  const initialCards = isCustomTopic
    ? await getCardsForTopic(selectedTopicId)
    : await getRandomCards(30);

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <GameBoard
        key={isCustomTopic ? selectedTopicId : 'default'}
        initialCards={initialCards}
        topics={topics}
        selectedTopicId={isCustomTopic ? selectedTopicId : null}
      />
    </main>
  );
}
