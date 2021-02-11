import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 345,
    padding: theme.spacing(2)
  },
  media: {
    height: 0
  }
}));

export default function ImgMediaCard(props) {
  const {data} = props
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardActionArea>
        <CardMedia
          component="img"
          alt="Fursona"
          height="350"
          image={data.designImageUrl}
          title="Fursona"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {data.designName}
          </Typography>
          <Typography>
          {data.designDescription}
            <Typography variant="body2" color="textSecondary" component="p">
            {data.designFursona}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
            {data.designFeatureId}
            </Typography>
            <Typography>
            ${data.designValue}
            </Typography>
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button size="small" color="primary">
          Hug
        </Button>
        <Button size="small" color="primary">
          Huggle
        </Button>
        <Button size="small" color="primary">
          Buy
        </Button>
      </CardActions>
    </Card>
  );
}