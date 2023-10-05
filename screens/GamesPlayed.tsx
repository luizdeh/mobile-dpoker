import { useContext, useEffect, useState } from 'react'
import { Center, Box, Spinner } from 'native-base'
import { SafeAreaView, ScrollView, StatusBar } from 'react-native'
import GameScoreboard from '../components/GameScoreboard'
import useGamesContext from '../context/useGamesContext'

export default function GamesPlayed() {
  const { games, players, gamePlayers, gamesPlayed } = useGamesContext()

  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<any[]>([])

  useEffect(() => {
    if (games?.length && gamePlayers?.length && players?.length && gamesPlayed?.length) {
      setStats(gamesPlayed)
      setIsLoading(false)
    }
  }, [])

  return (
    <Box h="100%" px="2" py="2" backgroundColor="black">
      {isLoading ? (
        <Center flex={1}>
          <Spinner size="lg" color="emerald.600" />
        </Center>
      ) : (
        <SafeAreaView style={{ flex: 1, paddingTop: StatusBar.currentHeight }}>
          <ScrollView style={{ marginHorizontal: 10 }}>
            {stats
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((game: any, index: number) => {
                return (
                  <GameScoreboard
                    key={index}
                    game={game}
                    index={index}
                  />
                )
              })}
          </ScrollView>
        </SafeAreaView>
      )}
    </Box>
  )
}