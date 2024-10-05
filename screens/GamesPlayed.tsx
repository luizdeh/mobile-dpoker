import { useContext, useEffect, useState } from 'react'
import { Center, Box, Spinner } from 'native-base'
import { SafeAreaView, ScrollView, StatusBar } from 'react-native'
import GameScoreboard from '../components/GameScoreboard'
import useGamesContext from '../context/useGamesContext'

export default function GamesPlayed() {
  const { games, players, gamePlayers, gamesPlayed } = useGamesContext()

  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<any[]>([])
  const [statsLength, setStatsLength] = useState(0)

  useEffect(() => {
    if (games?.length && gamePlayers?.length && players?.length && gamesPlayed?.length) {
      setStats(gamesPlayed)
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (stats) {
      setStatsLength(stats.length)
      console.log(stats)
    }
  }, [stats])

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
              .sort((a, b) => b.date.localeCompare(a.date))
              // .sort((a, b) => b.rebuyRatio - a.rebuyRatio)
              .map((game: any, index: number) => {
                const num = statsLength - index
                return (
                  <GameScoreboard
                    key={index}
                    game={game}
                    num={num}
                  />
                )
              })}
          </ScrollView>
        </SafeAreaView>
      )}
    </Box>
  )
}