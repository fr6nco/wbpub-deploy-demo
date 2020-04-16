import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import * as convert from 'xml-js';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';

export interface Article {
  title: string;
  description: string;
  pubDate: string;
  link: string;
  image: string;
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  title = "rssFe";

  @ViewChild("urlInput") urlInput: ElementRef;

  loaded: boolean;
  loading: boolean;
  faCoffee = faCoffee;

  article_id: number = 0;

  articles: Article[];

  onLoadClick() {
    console.log("clicked");
    console.log(this.urlInput.nativeElement.value);

    this.loading = true;
    //  curl -v http://localhost:8000/fetchurl -H "Content-type: application/json" --data '{"url": "https://www.sme.sk/rss-title"}'

    this.http
      .post('https://webp.itprof.sk/fetchurl', {
        url: this.urlInput.nativeElement.value,
      },
      {
        responseType: 'text',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/rss+xml'
        }
      })
      .subscribe(res => {
        try {
          const jsonData: {rss: {channel: {item: any[]}}} = JSON.parse(convert.xml2json(res, {compact: true}));

          this.articles = jsonData.rss.channel.item.map((e) => {
            return {
              title: e.title._text,
              description: e.description._text,
              pubDate: e.pubDate._text,
              link: e.link._text,
              image: e.enclosure._attributes.url
            }
          });
          console.log(this.articles);

          this.loading = false;
          this.loaded = true;
        } catch (err) {
          console.error(`Failed to parse response ${err}`);
        }
      },
      err => {
        console.log(err);
      });
  }

  loadArticle(article: Article) {
    this.article_id = this.articles.indexOf(article);
  }

  ngOnInit() {
    this.loading = false;
    this.articles = [];
    this.loading = false;
    this.loaded = false;
  }

  constructor(private http: HttpClient) {}
}
