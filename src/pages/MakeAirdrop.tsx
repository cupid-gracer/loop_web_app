import { Helmet } from "react-helmet"
import Grid from "../components/Grid"
import Page from "../components/Page"
import Container from "../components/Container"
import AirdropForm from "../forms/AirdropForm"
import styles from './MakeAirdrop.module.scss'

const MakeAirdrop = () => {
  return (
    <Grid>
      <Helmet>
        <title>Loop Markets | Airdrop</title>
      </Helmet>
      <Page className={styles.page}>
      <Container sm className={styles.container}>
              <AirdropForm />
            </Container>
      </Page>
    </Grid>
  )
}

export default MakeAirdrop
