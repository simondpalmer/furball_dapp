import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 345,
    padding: theme.spacing(2)
  },
  media: {
    height: 0
  }
}));

interface DesignCardProps {
  designImageUrl: string;
  designName: string;
  designDescription: string;
  designFursona: string;
  designFeatureId: string;
  designValue: string;
}

export default function Designcard(props: DesignCardProps) {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardActionArea>
        <CardMedia
          component="img"
          alt="Fursona"
          height="350"
          image={props.designImageUrl}
          title="Fursona"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {props.designName}
          </Typography>
          <Typography>
            {props.designDescription}
            <Typography variant="body2" color="textSecondary" component="p">
              {props.designFursona}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {props.designFeatureId}
            </Typography>
            <Typography>
              ${props.designValue}
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