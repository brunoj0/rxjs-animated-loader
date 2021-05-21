import {
  Component,
  ElementRef,
  Renderer2,
  VERSION,
  ViewChild
} from '@angular/core';
import {
  animationFrameScheduler,
  combineLatest,
  concat,
  defer,
  fromEvent,
  interval,
  merge,
  Observable,
  timer
} from 'rxjs';
import {
  filter,
  map,
  mapTo,
  startWith,
  switchMap,
  take,
  takeUntil,
  takeWhile,
  tap,
  withLatestFrom
} from 'rxjs/operators';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor() {}
  position;

  name = 'Angular ' + VERSION.major;

  animFrame$ = interval(0, animationFrameScheduler);
  touchStart$ = fromEvent(document, 'mousedown');

  tocuhEnd$ = fromEvent(document, 'mouseup');

  touchMove$ = fromEvent(document, 'mousemove');

  transform$ = this.touchStart$.pipe(
    switchMap((initalMouse: MouseEvent) => {
      return concat(
        this.touchMove$.pipe(
          withLatestFrom(this.animFrame$),
          map(([data, anim]) => data),
          tap(
            (data: MouseEvent) =>
              (this.position = data.clientY - initalMouse.clientY)
          ),
          takeWhile(h => this.position < window.innerWidth / 2),
          map(
            (data: MouseEvent) =>
              `translate3d(0,${this.position}px, 0) rotate(${360 *
                (this.position / window.innerWidth)}deg)`
          ),
          takeUntil(this.tocuhEnd$)
        ),
        defer(() =>
          this.tweenObservable(this.position, 0, 400).pipe(
            map(
              data =>
                `translate3d(0,${data}px, 0) rotate(${360 *
                  (data / window.innerWidth)}deg)`
            )
          )
        )
      );
    })
  );

  private tweenObservable(start, end, time) {
    const emissions = time / 10;
    const step = (start - end) / emissions;

    return timer(0, 10).pipe(
      map(x => start - step * (x + 1)),
      take(emissions)
    );
  }
}
