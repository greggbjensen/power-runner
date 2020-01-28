import { AfterViewInit, Directive, ElementRef, HostListener, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { IScriptExit, ScriptRef } from 'src/app/core/models';
import { StatusService } from 'src/app/core/services';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import { WebLinksAddon } from 'xterm-addon-web-links';

@Directive({
  selector: '[pruScriptLogWriter]',
  exportAs: 'scriptLogWriter'
})
export class ScriptLogWriterDirective implements AfterViewInit, OnDestroy {

  private _scriptRef: ScriptRef;
  private _dataSubscription: Subscription;
  private _exitSubscription: Subscription;
  private _terminal: Terminal;
  private _fitAddon: FitAddon;
  private _searchAddon: SearchAddon;

  @Input() public set scriptRef(value: ScriptRef) {
    this.unsubscribeAll();
    this._scriptRef = value;

    if (this._terminal) {
      this._terminal.clear();
    }

    if (this._scriptRef) {
      this._dataSubscription = this._scriptRef.data.subscribe(data => {
        this._terminal.write(data);
      });
      this._exitSubscription = this._scriptRef.exit.subscribe((scriptExit: IScriptExit) => {
        const message = scriptExit.exitCode === 0 ? ' completed' : ` failed with exit code ${scriptExit.exitCode}`;
        this._statusService.setStatus(`${this.scriptRef.script.module.toUpperCase()}/${this.scriptRef.script.name} ${message}`);
      });
    }
  }

  public get scriptRef(): ScriptRef {
    return this._scriptRef;
  }

  constructor(
    private _element: ElementRef,
    private _statusService: StatusService
  ) { }

  @HostListener('window:resize') public onResize(): void {
    if (this._fitAddon) {
      this._fitAddon.fit();
    }
  }

  public searchNext(searchText: string): void {
    if (this._searchAddon) {
      this._searchAddon.findNext(searchText);
    }
  }

  public searchPrevious(searchText: string): void {
    if (this._searchAddon) {
      this._searchAddon.findPrevious(searchText);
    }
  }

  public ngAfterViewInit(): void {
    this._terminal = new Terminal({
      disableStdin: true,
      theme: {
        background: '#1e1e1e'
      }
    });
    this._terminal.attachCustomKeyEventHandler(event => {
      let handle = true;
      if (event.ctrlKey && event.key === 'c') {
        this.copyToClipboard();
        handle = false;
      }

      return handle;
    });
    this._fitAddon = new FitAddon();
    this._searchAddon = new SearchAddon();
    this._terminal.loadAddon(new WebLinksAddon());
    this._terminal.loadAddon(this._fitAddon);
    this._terminal.loadAddon(this._searchAddon);
    setTimeout(() => {
      this._terminal.open(this._element.nativeElement);
      this._fitAddon.fit();
    }, 1);
  }

  public ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  private copyToClipboard(): void {
    document.execCommand('copy');
  }

  private unsubscribeAll(): void {
    if (this._dataSubscription) {
      this._dataSubscription.unsubscribe();
    }

    if (this._exitSubscription) {
      this._dataSubscription.unsubscribe();
    }
  }

  private scrollToBottom(): void {

    // SourceRef: https://stackoverflow.com/questions/35232731/angular-2-scroll-to-bottom-chat-style
    try {
        this._element.nativeElement.scrollTop = this._element.nativeElement.scrollHeight;
    } catch (err) { }
  }
}
